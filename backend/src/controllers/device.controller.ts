import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.guard";
import { DeviceService } from "../services/device.service";

export class DeviceController {
  private deviceService = new DeviceService();

  public register = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { pushToken, platform, deviceModel, appVersion } = req.body;
      const device = await this.deviceService.registerDevice(
        req.user!.userId,
        pushToken,
        platform,
        deviceModel,
        appVersion,
      );
      res.status(201).json(device);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public unregister = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { pushToken } = req.body;
      await this.deviceService.unregisterDevice(req.user!.userId, pushToken);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
