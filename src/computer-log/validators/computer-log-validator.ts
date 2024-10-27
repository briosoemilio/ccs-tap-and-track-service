import { BadGatewayException, BadRequestException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { ComputerService } from 'src/computer/computer.service';
import { ComputerLogService } from '../computer-log.service';

export class ComputerLogValidator {
  constructor(
    private readonly computerService: ComputerService,
    private readonly userService: UserService,
    private readonly computerLogService: ComputerLogService,
  ) {}

  validateUser = async (userId: number) => {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new BadRequestException(`User with id does not exist : ${userId}`);
    }
  };

  validateComputer = async (computerId: number) => {
    // Check if Computer Exists
    const computer = await this.computerService.findById(computerId);
    if (!computer) {
      throw new BadRequestException(
        `Computer with id does not exist : ${computerId}`,
      );
    }

    // Computer first time usage: do nothing
    if (!computer.lastLogUUID) return;

    // Check if computer still in use
    const latestLog = await this.computerLogService.findByUUID(
      computer.lastLogUUID,
    );
    const isComputerInUse = latestLog.endedAt === null;
    const latestUser = await this.userService.findById(latestLog.userId);
    if (isComputerInUse) {
      throw new BadRequestException(`Computer still in use, please log out first : ${latestUser.name}.`);
    }
  };

  updateLatestLog = async (computerId: number, logUUID: string) => {
    const updatedComputer = await this.computerService.updateLastLog(
      computerId,
      logUUID,
    );
    if (!updatedComputer) {
      throw new BadGatewayException(
        `An error has occurred please contact support.`,
      );
    }
  };

  validateLog = async () => {};
}
