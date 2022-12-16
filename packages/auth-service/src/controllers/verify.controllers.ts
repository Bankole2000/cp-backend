import { Request, Response } from "express";
import UserDBService from "../services/user.service";

const userService = new UserDBService();

export const verifyEmailHandler = async (req: Request, res: Response) => {
  const { email, token } = req.query;
  if (!email || !token) {
    return res.status(400).send("Bad request");
  }

  const user = await userService.findUserByEmail(email as string);
  if (!user) {
    return res.status(400).send("Bad request");
  }

  if (user.data.verificationCode !== token) {
    return res.status(400).send("Bad request");
  }

  await userService.updateUser(user.data.userId, { verified: true });
  res.send("Email verified");
};

export const verifyPhoneHandler = async (req: Request, res: Response) => {
  const { phone, token } = req.query;
  if (!phone || !token) {
    return res.status(400).send("Bad request");
  }

  const user = await userService.findUserByPhoneNumber(phone as string);
  if (!user) {
    return res.status(400).send("Bad request");
  }

  if (user.data.verificationCode !== token) {
    return res.status(400).send("Bad request");
  }

  await userService.updateUser(user.data.userId, { verified: true });
  res.send("Phone verified");
};

export const sendEmailVerificationCodeHandler = async (req: Request, res: Response) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).send("Bad request");
  }

  const user = await userService.findUserByEmail(email as string);
  if (!user) {
    return res.status(400).send("Bad request");
  }

  const verificationCode = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
  await userService.updateUser(user.data.userId, { verificationCode });

  res.send("Verification code sent");
};

export const sendPhoneVerificationCodeHandler = async (req: Request, res: Response) => {
  const { phone } = req.query;
  if (!phone) {
    return res.status(400).send("Bad request");
  }

  const user = await userService.findUserByPhoneNumber(phone as string);
  if (!user) {
    return res.status(400).send("Bad request");
  }

  const verificationCode = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
  await userService.updateUser(user.data.userId, { verificationCode });

  res.send("Verification code sent");
};

export const sendEmailDeviceVerificationHandler = async (req: Request, res: Response) => {
  res.send("Email Verification code sent");
};

export const sendPhoneDeviceVerificationHandler = async (req: Request, res: Response) => {
  res.send("Phone Verification code sent");
};