import { ServiceResponse } from '@cribplug/common';
import { Request, Response } from 'express';
import fs, { PathLike } from 'fs';
import http from 'http';
import path from 'path';
import { logResponse } from '../middleware/logRequests';
import UserDBService from '../services/user.service';
import { config } from '../utils/config';
import PBService from '../services/pb.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const FormData = require('form-data');

const userService = new UserDBService();

const { pocketbase } = config;
const pb = new PBService(pocketbase.url || '');

export const getCurrentUserProfile = async (req: Request, res: Response) => {
  let userId: string | null = null;
  if (req.user) {
    userId = req.user.userId;
  }
  if (!userId) {
    const sr = new ServiceResponse('Unauthenticated', null, false, 401, 'Unauthorized', 'PROFILE_SERVICE_USER_NOT_AUTHENTICATED', 'You need to be Logged in to perform this action');
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  const sr = await userService.getProfileByUserId(userId);
  await logResponse(req, sr);
  return res.status(sr.statusCode).send(sr);
};

export const getProfileByUsername = async (req: Request, res: Response) => {
  const { username } = req.params;
  const sr = await userService.findUserByUsername(username);
  await logResponse(req, sr);
  return res.status(sr.statusCode).send(sr);
};

export const getProfileByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const sr = await userService.findUserById(userId);
  await logResponse(req, sr);
  return res.status(sr.statusCode).send(sr);
};

export const updateProfile = async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { username, email, password } = req.body;
  const sr = await userService.updateUser(userId, username);
  await logResponse(req, sr);
  return res.status(sr.statusCode).send(sr);
};

export const updateProfileImage = async (req: Request, res: Response) => {
  console.log({ reqBody: req.body, file: req.file });
  if (!req.user) {
    const sr = new ServiceResponse('Unauthenticated', null, false, 401, 'Unauthorized', 'PROFILE_SERVICE_USER_NOT_AUTHENTICATED', 'You need to be Logged in to perform this action');
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  await pb.saveAuth(req.user.pbToken, req.user.pbUser);
  const form = new FormData();
  form.append('profileImage', fs.createReadStream(req.file?.path as PathLike));
  const pbimg = await pb.updateProfileImage(req.user.userId, form);
  if (!pbimg.success) {
    await logResponse(req, pbimg);
    return res.status(pbimg.statusCode).send(pbimg);
  }
  const imageUrl = await pb.generateImageUrl(pbimg.data, pbimg.data.profileImage);
  const updateUser = await userService.updateUser(req.user.userId, { imageUrl });
  if (updateUser.success) {
    const { username } = updateUser.data;
    const folder = path.join(`${__dirname}`, `/../../uploads/${username}/`);
    fs.access(folder, (error) => {
      if (error) {
        console.log('Directory does not exist.');
        fs.mkdirSync(folder, { recursive: true });
      } else {
        console.log('Directory exists.');
      }
    });
    fs.readdir(folder, (err, files) => {
      if (err) throw err;
      files.forEach((file) => {
        if (file === username || file.includes(`${username}-`)) {
          fs.unlinkSync(`${folder}${file}`);
        }
      });
    });
  }
  await logResponse(req, updateUser);
  return res.status(updateUser.statusCode).send(updateUser);
};

export const getProfileImagehandler = async (req: Request, res: Response) => {
  const { username } = req.params;
  const { w } = req.query;
  const width = w || 100;
  const folder = path.join(`${__dirname}`, `/../../uploads/${username}/`);
  fs.access(folder, (error) => {
    if (error) {
      console.log('Directory does not exist.');
      fs.mkdirSync(folder, { recursive: true });
    } else {
      console.log('Directory exists.');
    }
  });
  const defaultImageFilePath = path.join(`${__dirname}`, '/../utils/data/defaultuserprofileimage.webp');
  const filePath = path.join(`${__dirname}`, `/../../uploads/${username}/`, `${username}-${width}x${width}`);
  if (fs.existsSync(filePath)) {
    const stream = fs.createReadStream(filePath);
    return stream.pipe(res);
  }
  const user = await userService.findUserByUsername(username);
  if (user.success) {
    if (user.data.imageUrl) {
      const file = fs.createWriteStream(filePath);
      return http.get(`${user.data.imageUrl}?thumb=${width}x${width}`, (resp) => {
        resp.pipe(file);
        file.on('finish', () => {
          const stream = fs.createReadStream(filePath);
          return stream.pipe(res);
        });
      });
    }
    const stream = fs.createReadStream(defaultImageFilePath);
    return stream.pipe(res);
  }
  const stream = fs.createReadStream(defaultImageFilePath);
  return stream.pipe(res);
};

export const updateProfileWallpaper = async (req: Request, res: Response) => {
  console.log({ reqBody: req.body, file: req.file });
  if (!req.user) {
    const sr = new ServiceResponse('Unauthenticated', null, false, 401, 'Unauthorized', 'PROFILE_SERVICE_USER_NOT_AUTHENTICATED', 'You need to be Logged in to perform this action');
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  await pb.saveAuth(req.user.pbToken, req.user.pbUser);
  const form = new FormData();
  form.append('profileWallpaper', fs.createReadStream(req.file?.path as PathLike));
  const pbimg = await pb.updateProfileImage(req.user.userId, form);
  if (!pbimg.success) {
    await logResponse(req, pbimg);
    return res.status(pbimg.statusCode).send(pbimg);
  }
  const wallpaperUrl = await pb.generateImageUrl(pbimg.data, pbimg.data.profileWallpaper);
  const updateUser = await userService.updateUser(req.user.userId, { wallpaperUrl });

  if (updateUser.success) {
    const { username } = updateUser.data;
    const folder = path.join(`${__dirname}`, `/../../uploads/${username}/`);
    fs.access(folder, (error) => {
      if (error) {
        console.log('Directory does not exist.');
        fs.mkdirSync(folder, { recursive: true });
      } else {
        console.log('Directory exists.');
      }
    });
    fs.readdir(folder, (err, files) => {
      if (err) throw err;
      files.forEach((file) => {
        if (file.startsWith(`wallpaper-${username}-`)) {
          fs.unlinkSync(`${folder}${file}`);
        }
      });
    });
  }

  await logResponse(req, updateUser);
  return res.status(updateUser.statusCode).send(updateUser);
};

export const getProfileWallpaperhandler = async (req: Request, res: Response) => {
  const { username } = req.params;
  const { w } = req.query;
  const width = w || 500;

  const folder = path.join(`${__dirname}`, `/../../uploads/${username}/`);
  fs.access(folder, (error) => {
    if (error) {
      console.log('Directory does not exist.');
      fs.mkdirSync(folder, { recursive: true });
    } else {
      console.log('Directory exists.');
    }
  });
  const defaultImageFilePath = path.join(`${__dirname}`, '/../utils/data/housebackground.webp');
  const filePath = path.join(`${__dirname}`, `/../../uploads/${username}/`, `wallpaper-${username}-${+width * 1.8}x${width}`);
  if (fs.existsSync(filePath)) {
    const stream = fs.createReadStream(filePath);
    return stream.pipe(res);
  }
  const user = await userService.findUserByUsername(username);
  if (user.success) {
    if (user.data.wallpaperUrl) {
      const file = fs.createWriteStream(filePath);
      const url = `${user.data.wallpaperUrl}?thumb=${+width * 1.8}x${width}`;
      console.log({ url });
      return http.get(url, (resp) => {
        resp.pipe(file);
        file.on('finish', () => {
          const stream = fs.createReadStream(filePath);
          return stream.pipe(res);
        });
      });
    }
    const stream = fs.createReadStream(defaultImageFilePath);
    return stream.pipe(res);
  }
  const stream = fs.createReadStream(defaultImageFilePath);
  return stream.pipe(res);
};
