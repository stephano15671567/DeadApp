import { Request, Response } from 'express';
import mongoose from 'mongoose';

export const statusController = async (_req: Request, res: Response) => {
  try {
    const state = mongoose.connection.readyState; // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    return res.status(200).json({ status: 'OK', mongoState: state });
  } catch (err) {
    console.error('Error checking status:', err);
    return res.status(500).json({ status: 'ERROR', error: String(err) });
  }
};
