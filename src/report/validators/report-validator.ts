import { NotFoundException } from '@nestjs/common';
import { ItemService } from 'src/item/item.service';
import { UserService } from 'src/user/user.service';

export class ReportValidator {
  constructor(
    private readonly itemService: ItemService,
    private readonly userService: UserService,
  ) {}

  validateUser = async (userId: number) => {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException(`Error user not found : ${userId}`);
    }
  };

  validateItem = async (itemId: number) => {
    const item = await this.itemService.findByID(itemId);
    if (!item) {
      throw new NotFoundException(`Error item not found : ${itemId}`);
    }
  };
}
