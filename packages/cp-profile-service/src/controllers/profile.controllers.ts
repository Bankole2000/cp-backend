import { ServiceResponse } from '@cribplug/common';
import { Request, Response } from 'express';
import fs, { PathLike } from 'fs';
import http from 'http';
import axios from 'axios';
import path from 'path';
import { logResponse } from '../middleware/logRequests';
import UserDBService from '../services/user.service';
import cloudinary from '../utils/cloudinary';
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
  if(!pbimg.success) {
    await logResponse(req, pbimg);
    return res.status(pbimg.statusCode).send(pbimg);
  }
  const imageUrl = await pb.generateImageUrl(pbimg.data, pbimg.data.profileImage);
  const updateUser = await userService.updateUser(req.user.userId, { imageUrl });
  await logResponse(req, updateUser);
  return res.status(updateUser.statusCode).send(updateUser);
  // const { redisConfig: { scope }, self: { env } } = config;
  // const { username } = req.user;
  // const resourceName = `${scope}/${env}/profile/${username}`;
  // const cloudUrl = cloudinary.url(resourceName);
  // const existsResult = await axios.head(cloudUrl).catch((err) => err);
  // if (existsResult.status >= 200 && existsResult.status < 300) {
  //   await cloudinary.uploader.destroy(resourceName, { invalidate: true });
  // }
  // try {
  //   const result = await cloudinary.uploader.upload(req.file ? req.file.path : '', {
  //     public_id: `${resourceName}`,
  //     overwrite: true,
  //     transformation: { width: 1000, height: 1000, crop: 'limit' },
  //     invalidate: true,
  //   });
  //   const folder = path.join(`${__dirname}`, `/../../uploads/${username}/`);
  //   fs.access(folder, (error) => {
  //     if (error) {
  //       console.log('Directory does not exist.');
  //       fs.mkdirSync(folder, { recursive: true });
  //     } else {
  //       console.log('Directory exists.');
  //     }
  //   });
  //   fs.readdir(folder, (err, files) => {
  //     if (err) throw err;
  //     files.forEach((file) => {
  //       if (file === username || file.includes(`${username}-`)) {
  //         fs.unlinkSync(`${folder}${file}`);
  //       }
  //     });
  //   });
  //   const updatedProfile = await userService.updateUserProfileImage(req.user.userId, result.url, result.secure_url, result);
  //   if (!updatedProfile.success) {
  //     await logResponse(req, updatedProfile);
  //     return res.status(updatedProfile.statusCode).send(updatedProfile);
  //   }
  //   const serviceResponse = new ServiceResponse(
  //     `@${req.user.username}'s Profile Image updated`,
  //     updatedProfile.data,
  //     // 'message',
  //     true,
  //     201,
  //     null,
  //     null,
  //     res.locals.newAccessToken
  //   );
  //   await logResponse(req, serviceResponse);
  //   return res.status(serviceResponse.statusCode).send(serviceResponse);
  // } catch (error: any) {
  //   const serviceResponse = new ServiceResponse(
  //     'Error uploading profile image',
  //     null,
  //     false,
  //     500,
  //     error.message,
  //     error,
  //     res.locals.newAccessToken
  //   );
  //   await logResponse(req, serviceResponse);
  //   return res.status(serviceResponse.statusCode).send(serviceResponse);
  // }
};

export const getProfileImagehandler = async (req: Request, res: Response) => {
  const { username } = req.params;
  const { w } = req.query;
  const width = w || 200;
  const folder = path.join(`${__dirname}`, `/../../uploads/${username}/`);
  fs.access(folder, (error) => {
    if (error) {
      console.log('Directory does not exist.');
      fs.mkdirSync(folder, { recursive: true });
    } else {
      console.log('Directory exists.');
    }
  });
  const filePath = path.join(`${__dirname}`, `/../../uploads/${username}/`, `${username}-${width}`);
  if (fs.existsSync(filePath)) {
    const stream = fs.createReadStream(filePath);
    return stream.pipe(res);
  }
  const { redisConfig: { scope }, self: { env } } = config;
  const resourceName = `${scope}/${env}/profile/${username}`;
  return cloudinary.api
    .resource(resourceName)
    .then((r) => {
      console.log({ r });
      // cloudinary.uploader.explicit(r.url, { type: 'fetch', invalidate: true }, (result) => {
      //   console.log({ newResult: result });
      // });
      const url = cloudinary.url(resourceName, {
        transformation: {
          width, crop: 'fill', height: width, quality: 'auto'
        },
      });
      const file = fs.createWriteStream(filePath);
      return http.get(url, (resp) => {
        resp.pipe(file);
        file.on('finish', () => {
          const stream = fs.createReadStream(filePath);
          return stream.pipe(res);
        });
      });
    }).catch((e) => {
      const defaultImageFilePath = path.join(`${__dirname}`, '/../utils/data/defaultuserprofileimage.webp');
      const stream = fs.createReadStream(defaultImageFilePath);
      return stream.pipe(res);
    });
};

export const updateProfileWallpaper = async (req: Request, res: Response) => {
  if (!req.user) {
    const sr = new ServiceResponse('Unauthenticated', null, false, 401, 'Unauthorized', 'PROFILE_SERVICE_USER_NOT_AUTHENTICATED', 'You need to be Logged in to perform this action');
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  const { redisConfig: { scope }, self: { env } } = config;
  const { username } = req.user;
  const resourceName = `${scope}/${env}/profile/wallpaper-${username}`;
  const cloudUrl = cloudinary.url(resourceName);
  const existsResult = await axios.head(cloudUrl).catch((err) => err);
  if (existsResult.status >= 200 && existsResult.status < 300) {
    await cloudinary.uploader.destroy(resourceName, { invalidate: true });
  }
  try {
    const result = await cloudinary.uploader.upload(req.file ? req.file.path : '', {
      public_id: `${resourceName}`,
      overwrite: true,
      invalidate: true,
    });
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
        if (file === `wallpaper-${username}`) {
          fs.unlinkSync(`${folder}${file}`);
        }
      });
    });
    const updatedProfile = await userService.updateUserWallpaperImage(req.user.userId, result.url, result.secure_url, result);
    if (!updatedProfile.success) {
      await logResponse(req, updatedProfile);
      return res.status(updatedProfile.statusCode).send(updatedProfile);
    }
    const serviceResponse = new ServiceResponse(
      `@${req.user.username}'s Profile Wallpaper updated`,
      updatedProfile.data,
      // 'message',
      true,
      201,
      null,
      null,
      res.locals.newAccessToken
    );
    await logResponse(req, serviceResponse);
    return res.status(serviceResponse.statusCode).send(serviceResponse);
  } catch (error: any) {
    const serviceResponse = new ServiceResponse(
      'Error uploading profile wallpaper',
      null,
      false,
      500,
      error.message,
      error,
      res.locals.newAccessToken
    );
    await logResponse(req, serviceResponse);
    return res.status(serviceResponse.statusCode).send(serviceResponse);
  }
};

export const getProfileWallpaperhandler = async (req: Request, res: Response) => {
  // const { username } = req.params;
  const { username } = req.params;
  const filePath = path.join(`${__dirname}`, `/../../uploads/${username}/`, `wallpaper-${username}`);
  if (fs.existsSync(filePath)) {
    const stream = fs.createReadStream(filePath);
    return stream.pipe(res);
  }
  const { redisConfig: { scope }, self: { env } } = config;
  const resourceName = `${scope}/${env}/profile/wallpaper-${username}`;
  return cloudinary.api
    .resource(resourceName)
    .then((r) => {
      console.log({ r });
      // cloudinary.uploader.explicit(r.url, { type: 'fetch', invalidate: true }, (result) => {
      //   console.log({ newResult: result });
      // });
      const url = cloudinary.url(resourceName);
      const file = fs.createWriteStream(filePath);
      return http.get(url, (resp) => {
        resp.pipe(file);
        file.on('finish', () => {
          const stream = fs.createReadStream(filePath);
          return stream.pipe(res);
        });
      });
    }).catch((e) => {
      const defaultImageFilePath = path.join(`${__dirname}`, '/../utils/data/housebackground.webp');
      const stream = fs.createReadStream(defaultImageFilePath);
      return stream.pipe(res);
    });
};
