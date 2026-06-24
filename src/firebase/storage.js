import { storage } from './config';
export { storage };
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage';

export const uploadImage = async (file, path = 'products') => {
  try {
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '-').toLowerCase();
    const storageRef = ref(storage, `${path}/${timestamp}-${sanitizedName}`);

    // Compress if image is too large (> 2MB)
    let fileToUpload = file;
    if (file.size > 2 * 1024 * 1024 && file.type.startsWith('image/')) {
      fileToUpload = await compressImage(file);
    }

    const snapshot = await uploadBytes(storageRef, fileToUpload, {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    const downloadURL = await getDownloadURL(snapshot.ref);
    return {
      url: downloadURL,
      path: snapshot.ref.fullPath,
      name: sanitizedName,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const uploadMultipleImages = async (files, path = 'products') => {
  try {
    const uploadPromises = Array.from(files).map((file) => uploadImage(file, path));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

export const deleteImage = async (imagePath) => {
  try {
    const storageRef = ref(storage, imagePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

export const listImages = async (path = 'products') => {
  try {
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    const urls = await Promise.all(
      result.items.map(async (item) => ({
        name: item.name,
        path: item.fullPath,
        url: await getDownloadURL(item),
      }))
    );
    return urls;
  } catch (error) {
    console.error('Error listing images:', error);
    return [];
  }
};

const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1920;
        let { width, height } = img;

        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }
        if (height > MAX_HEIGHT) {
          width = (width * MAX_HEIGHT) / height;
          height = MAX_HEIGHT;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, { type: 'image/webp' }));
          },
          'image/webp',
          0.85
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};
