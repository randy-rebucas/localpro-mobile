# Mobile Avatar Upload Guide

This guide explains how to upload user avatars from mobile applications (React Native, Expo, iOS, Android) to the LocalPro API.

## Overview

The avatar upload endpoint accepts files via `multipart/form-data` with the field name `avatar`. The file must be a JPEG or PNG image with a maximum size of 2MB.

## API Endpoint

```
POST /api/auth/upload-avatar
```

**Headers:**
- `Authorization: Bearer <jwt_token>` (Required)
- `Content-Type: multipart/form-data` (Required)

**Request:**
- Field name: `avatar`
- File type: `image/jpeg` or `image/png`
- Max size: 2MB (2,097,152 bytes)

**Response:**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatar": {
      "url": "https://res.cloudinary.com/.../avatar.jpg",
      "publicId": "localpro/users/profiles/...",
      "thumbnail": "https://res.cloudinary.com/.../w_150,h_150,c_fill/..."
    }
  }
}
```

## React Native / Expo Implementation

### Using Expo ImagePicker

```javascript
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';

const uploadAvatar = async (token) => {
  try {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access media library is required');
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio
      quality: 0.8, // Compress to 80% quality
      allowsMultipleSelection: false,
    });

    if (result.canceled) {
      return { success: false, message: 'Image selection cancelled' };
    }

    const image = result.assets[0];

    // Validate file size (2MB limit)
    if (image.fileSize > 2 * 1024 * 1024) {
      throw new Error('Image size exceeds 2MB limit. Please choose a smaller image.');
    }

    // Create FormData
    const formData = new FormData();
    
    // Extract file extension from URI
    const uriParts = image.uri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    const mimeType = `image/${fileType === 'jpg' ? 'jpeg' : fileType}`;

    formData.append('avatar', {
      uri: image.uri,
      type: mimeType,
      name: `avatar.${fileType}`,
    });

    // Upload to server
    const response = await fetch(`${API_BASE_URL}/api/auth/upload-avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload avatar');
    }

    return {
      success: true,
      data: data.data.avatar,
    };
  } catch (error) {
    console.error('Avatar upload error:', error);
    return {
      success: false,
      message: error.message || 'Failed to upload avatar',
    };
  }
};
```

### Using React Native Image Picker

```javascript
import ImagePicker from 'react-native-image-picker';
import { Platform } from 'react-native';

const uploadAvatar = async (token) => {
  return new Promise((resolve, reject) => {
    const options = {
      title: 'Select Avatar',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
      allowsEditing: true,
      mediaType: 'photo',
    };

    ImagePicker.showImagePicker(options, async (response) => {
      if (response.didCancel) {
        resolve({ success: false, message: 'User cancelled image picker' });
        return;
      }

      if (response.error) {
        reject(new Error(response.error));
        return;
      }

      try {
        // Validate file size
        if (response.fileSize > 2 * 1024 * 1024) {
          throw new Error('Image size exceeds 2MB limit');
        }

        // Create FormData
        const formData = new FormData();
        
        // Determine MIME type
        let mimeType = 'image/jpeg';
        if (response.type) {
          mimeType = response.type;
        } else if (response.uri.endsWith('.png')) {
          mimeType = 'image/png';
        }

        // For Android, use the actual file path
        // For iOS, use the URI
        const uri = Platform.OS === 'android' 
          ? response.uri 
          : response.uri.replace('file://', '');

        formData.append('avatar', {
          uri: uri,
          type: mimeType,
          name: response.fileName || 'avatar.jpg',
        });

        // Upload to server
        const uploadResponse = await fetch(`${API_BASE_URL}/api/auth/upload-avatar`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        const data = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(data.message || 'Upload failed');
        }

        resolve({
          success: true,
          data: data.data.avatar,
        });
      } catch (error) {
        reject(error);
      }
    });
  });
};
```

## iOS (Swift) Implementation

```swift
import UIKit
import Alamofire

class AvatarUploadService {
    static let shared = AvatarUploadService()
    private let baseURL = "https://api.localpro.com"
    
    func uploadAvatar(image: UIImage, token: String, completion: @escaping (Result<AvatarResponse, Error>) -> Void) {
        guard let imageData = image.jpegData(compressionQuality: 0.8) else {
            completion(.failure(NSError(domain: "AvatarUpload", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to convert image to data"])))
            return
        }
        
        // Validate file size (2MB limit)
        if imageData.count > 2 * 1024 * 1024 {
            completion(.failure(NSError(domain: "AvatarUpload", code: -1, userInfo: [NSLocalizedDescriptionKey: "Image size exceeds 2MB limit"])))
            return
        }
        
        let url = "\(baseURL)/api/auth/upload-avatar"
        let headers: HTTPHeaders = [
            "Authorization": "Bearer \(token)"
        ]
        
        AF.upload(
            multipartFormData: { multipartFormData in
                multipartFormData.append(
                    imageData,
                    withName: "avatar",
                    fileName: "avatar.jpg",
                    mimeType: "image/jpeg"
                )
            },
            to: url,
            headers: headers
        )
        .responseDecodable(of: AvatarResponse.self) { response in
            switch response.result {
            case .success(let data):
                completion(.success(data))
            case .failure(let error):
                completion(.failure(error))
            }
        }
    }
}

struct AvatarResponse: Codable {
    let success: Bool
    let message: String
    let data: AvatarData
    
    struct AvatarData: Codable {
        let avatar: Avatar
        
        struct Avatar: Codable {
            let url: String
            let publicId: String
            let thumbnail: String
        }
    }
}
```

## Android (Kotlin) Implementation

```kotlin
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File

class AvatarUploadService {
    private val baseURL = "https://api.localpro.com"
    
    fun uploadAvatar(imageFile: File, token: String, callback: (Result<AvatarResponse>) -> Unit) {
        // Validate file size (2MB limit)
        if (imageFile.length() > 2 * 1024 * 1024) {
            callback(Result.failure(Exception("Image size exceeds 2MB limit")))
            return
        }
        
        val client = OkHttpClient()
        val url = "$baseURL/api/auth/upload-avatar"
        
        // Create multipart request body
        val requestBody = MultipartBody.Builder()
            .setType(MultipartBody.FORM)
            .addFormDataPart(
                "avatar",
                "avatar.jpg",
                imageFile.asRequestBody("image/jpeg".toMediaType())
            )
            .build()
        
        // Create request
        val request = Request.Builder()
            .url(url)
            .addHeader("Authorization", "Bearer $token")
            .post(requestBody)
            .build()
        
        // Execute request
        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                callback(Result.failure(e))
            }
            
            override fun onResponse(call: Call, response: Response) {
                if (!response.isSuccessful) {
                    callback(Result.failure(Exception("Upload failed: ${response.message}")))
                    return
                }
                
                try {
                    val json = response.body?.string()
                    val avatarResponse = parseAvatarResponse(json)
                    callback(Result.success(avatarResponse))
                } catch (e: Exception) {
                    callback(Result.failure(e))
                }
            }
        })
    }
    
    private fun parseAvatarResponse(json: String?): AvatarResponse {
        // Parse JSON response
        // Implementation depends on your JSON parsing library
        // (Gson, Moshi, etc.)
    }
}

data class AvatarResponse(
    val success: Boolean,
    val message: String,
    val data: AvatarData
)

data class AvatarData(
    val avatar: Avatar
)

data class Avatar(
    val url: String,
    val publicId: String,
    val thumbnail: String
)
```

## Image Optimization Best Practices

### 1. Compress Before Upload

Always compress images before uploading to reduce file size and improve upload speed:

```javascript
// React Native example
const compressImage = async (uri) => {
  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 800 } }], // Resize to max 800px width
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );
  return manipResult.uri;
};
```

### 2. Validate File Size

Always validate file size before uploading:

```javascript
const validateFileSize = (fileSize) => {
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (fileSize > maxSize) {
    throw new Error('Image size exceeds 2MB limit. Please choose a smaller image.');
  }
};
```

### 3. Crop to Square

For avatars, it's recommended to crop images to a square aspect ratio:

```javascript
// Expo ImagePicker
const result = await ImagePicker.launchImageLibraryAsync({
  allowsEditing: true,
  aspect: [1, 1], // Square
  quality: 0.8,
});
```

### 4. Handle Errors Gracefully

```javascript
const uploadAvatar = async (token) => {
  try {
    // ... upload logic
  } catch (error) {
    if (error.message.includes('size')) {
      // Show user-friendly message about file size
      Alert.alert('File Too Large', 'Please choose an image smaller than 2MB');
    } else if (error.message.includes('network')) {
      // Handle network errors
      Alert.alert('Network Error', 'Please check your internet connection');
    } else {
      // Generic error
      Alert.alert('Upload Failed', error.message);
    }
  }
};
```

## Error Handling

### Common Error Responses

**400 Bad Request - No file uploaded:**
```json
{
  "success": false,
  "message": "No file uploaded"
}
```

**400 Bad Request - File too large:**
```json
{
  "success": false,
  "message": "File size exceeds 2MB limit"
}
```

**400 Bad Request - Invalid file type:**
```json
{
  "success": false,
  "message": "Only JPEG and PNG images are allowed"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**500 Server Error:**
```json
{
  "success": false,
  "message": "Failed to upload avatar",
  "error": "Cloudinary upload error"
}
```

## Complete React Native Example

```javascript
import React, { useState } from 'react';
import { View, Button, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from './AuthContext';

const AvatarUploadComponent = () => {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const { token } = useAuth();

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant access to your photos');
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const image = result.assets[0];

      // Validate size
      if (image.fileSize > 2 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Please choose an image smaller than 2MB');
        return;
      }

      // Upload
      await uploadAvatar(image.uri, image.type || 'image/jpeg');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const uploadAvatar = async (uri, mimeType) => {
    setUploading(true);

    try {
      const formData = new FormData();
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      formData.append('avatar', {
        uri,
        type: mimeType,
        name: `avatar.${fileType}`,
      });

      const response = await fetch(`${API_BASE_URL}/api/auth/upload-avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setAvatarUrl(data.data.avatar.url);
      Alert.alert('Success', 'Avatar uploaded successfully');
    } catch (error) {
      Alert.alert('Upload Failed', error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      {avatarUrl && (
        <Image
          source={{ uri: avatarUrl }}
          style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 20 }}
        />
      )}
      <Button
        title={uploading ? 'Uploading...' : 'Upload Avatar'}
        onPress={pickImage}
        disabled={uploading}
      />
      {uploading && <ActivityIndicator style={{ marginTop: 10 }} />}
    </View>
  );
};

export default AvatarUploadComponent;
```

## Testing

### Test with cURL

```bash
curl -X POST \
  https://api.localpro.com/api/auth/upload-avatar \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "avatar=@/path/to/image.jpg"
```

### Test with Postman

1. Set method to `POST`
2. URL: `https://api.localpro.com/api/auth/upload-avatar`
3. Headers: Add `Authorization: Bearer YOUR_JWT_TOKEN`
4. Body: Select `form-data`
5. Add key `avatar` with type `File`
6. Select an image file
7. Send request

## Troubleshooting

### Issue: "Unexpected field" error

**Solution:** Ensure the field name is exactly `avatar` (case-sensitive) and Content-Type is `multipart/form-data`.

### Issue: File size validation fails

**Solution:** Compress the image before uploading. Use quality settings (0.7-0.8) and resize to reasonable dimensions (800x800px max).

### Issue: Network timeout

**Solution:** 
- Check internet connection
- Implement retry logic
- Show upload progress to users
- Consider chunked uploads for large files (though 2MB should be fine)

### Issue: Permission denied

**Solution:** Request proper permissions before accessing the image picker:

```javascript
// Expo
await ImagePicker.requestMediaLibraryPermissionsAsync();

// React Native
// Add permissions to AndroidManifest.xml and Info.plist
```

## Security Considerations

1. **Always validate file size** on the client before uploading
2. **Validate MIME type** to ensure only images are uploaded
3. **Use HTTPS** for all API requests
4. **Store JWT tokens securely** (use secure storage, not AsyncStorage)
5. **Handle errors gracefully** without exposing sensitive information

## Additional Resources

- [Expo ImagePicker Documentation](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [React Native Image Picker](https://github.com/react-native-image-picker/react-native-image-picker)
- [FormData API](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [Multipart Form Data](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST)

