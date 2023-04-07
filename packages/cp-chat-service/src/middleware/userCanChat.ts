import { ServiceResponse } from '@cribplug/common';
import { NextFunction, Request, Response } from 'express';
import ChatDBService from '../services/chat.service';

const chatService = new ChatDBService();

export const roomExists = async (req: Request, res: Response, next: NextFunction) => {
  const { roomId } = req.params;
  const rExists = await chatService.getRoomById(roomId);
  if (!rExists.success) {
    return res.status(rExists.statusCode).send(rExists);
  }
  return next();
};

export const userCanSendMessage = async (req: Request, res: Response, next: NextFunction) => {
  const { roomId } = req.params;
  const pExists = await chatService.getUserParticipation(roomId, req.user.userId);
  if (!pExists.success) {
    return res.status(pExists.statusCode).send(pExists);
  }
  return next();
};

export const messageExists = async (req: Request, res: Response, next: NextFunction) => {
  const { roomId, messageId } = req.params;
  const mExists = await chatService.getMessageById(messageId);
  if (!mExists.success) {
    return res.status(mExists.statusCode).send(mExists);
  }
  if (mExists.data.chatRoomId !== roomId) {
    const sr = new ServiceResponse('Message doesn\'t belong to chatroom', null, false, 400, 'This message is not in this chat room', 'CHAT_SERVICE_MESSAGE_CHATROOM_MISMATCH', 'Check logs and database');
    return res.status(sr.statusCode).send(sr);
  }
  return next();
};

export const userSentMessage = async (req: Request, res: Response, next: NextFunction) => {
  const { roomId, messageId } = req.params;
  const mExists = await chatService.getMessageById(messageId);
  if (!mExists.success) {
    return res.status(mExists.statusCode).send(mExists);
  }
  if (mExists.data.chatRoomId !== roomId) {
    const sr = new ServiceResponse('Message doesn\'t belong to chatroom', null, false, 400, 'This message is not in this chat room', 'CHAT_SERVICE_MESSAGE_CHATROOM_MISMATCH', 'Check logs and database');
    return res.status(sr.statusCode).send(sr);
  }
  if (mExists.data.userId !== req.user.userId) {
    const sr = new ServiceResponse('You didn\'t send this message', null, false, 403, 'Unauthorized', 'CHAT_SERVICE_ERROR_MESSAGE_DOES_NOT_BELONG_TO_USER', 'Check userId, messageId, and logs');
    return res.status(sr.statusCode).send(sr);
  }
  return next();
};
