import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ItemService } from 'src/item/item.service';
import { ComputerService } from '../computer.service';
import { LocationService } from 'src/location/location.service';

export class ComputerValidator {
  constructor(
    private readonly itemService: ItemService,
    private readonly computerService: ComputerService,
    private readonly locationService: LocationService,
  ) {}

  validateItemNames = async (itemNames: string[]) => {
    await Promise.all(
      itemNames.map(async (itemName: string) => {
        const item = await this.itemService.findByName(itemName);
        if (!item) {
          throw new NotFoundException(`Item not found : ${itemName}`);
        }

        if (item.status === 'UNDER_MAINTENANCE') {
          throw new BadRequestException(
            `Item is under maintenance : ${itemName}`,
          );
        }

        if (item.status === 'IN_USE') {
          throw new BadRequestException(`Item is already in use : ${itemName}`);
        }
      }),
    );
  };

  validateComputerName = async (computerName: string) => {
    const isComputerNameTaken =
      await this.computerService.findByName(computerName);
    if (isComputerNameTaken) {
      throw new BadRequestException(`Computer name taken: ${computerName}`);
    }
  };

  validateLocationName = async (locationName: string) => {
    const doesLocationExist =
      await this.locationService.findByName(locationName);
    if (!doesLocationExist) {
      throw new BadRequestException(
        `Location does not exist : ${locationName}`,
      );
    }
  };

  updateItems = async (
    itemNames: string[],
    computerId: number,
    locationName: string,
  ) => {
    itemNames.forEach(async (itemName) => {
      const item = await this.itemService.findByName(itemName);
      const { id } = item;
      // update status
      await this.itemService.updateItemStatus(id, 'IN_USE');

      // update computer id
      await this.itemService.updateItemComputerId(id, computerId);

      // update location if needed
      if (item.locationName === locationName) return;
      await this.itemService.updateItemLocation(id, locationName);
    });
  };
}
