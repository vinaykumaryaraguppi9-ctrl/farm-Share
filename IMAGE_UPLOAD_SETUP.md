# Image Upload Feature Setup Guide

## What's New

The Farm Equipment Sharing Platform now supports photo uploads for equipment owners. Owners can upload images when adding equipment to their listings, and these images will be displayed in:
- The homepage equipment cards
- Equipment detail pages
- Owner dashboard

## Setup Instructions

### 1. Backend - Install Dependencies

Navigate to the backend folder and install the multer package:

```bash
cd backend
npm install
```

This will install the new `multer` package (already added to package.json).

### 2. Backend - Verify Configuration

The backend is configured to:
- Create an `uploads` folder automatically
- Accept image files (jpeg, jpg, png, gif)
- Limit file size to 5MB
- Serve uploaded images at `http://localhost:5000/uploads/`

### 3. Start the Backend

```bash
npm start
```

### 4. Start the Frontend

In a new terminal, navigate to the frontend folder:

```bash
cd frontend
npm start
```

## How to Upload Equipment Photos

1. **Login** with your account (or register if you don't have one)
2. **Go to Dashboard** and click on "My Equipment" tab
3. **Click "+ Add Equipment"** button
4. **Fill in the equipment details:**
   - Equipment Name
   - Description
   - Category
   - Daily Rate
5. **Upload Photo:**
   - Click "Choose File" in the Upload Photo section
   - Select an image from your computer (JPG, PNG, or GIF)
   - You'll see a preview of the image
6. **Click "Add Equipment"** to submit

## Where Images Appear

### Homepage
- Equipment cards show the uploaded image
- Falls back to placeholder if no image provided

### Equipment Detail Page
- Large image display of the equipment
- Prominent display area

### Your Dashboard
- All equipment you own shows the uploaded image
- Grid layout with thumbnails

## File Storage

- Uploaded images are stored in: `backend/uploads/`
- Images are given unique filenames with timestamps
- Images are served at: `http://localhost:5000/uploads/filename.jpg`

## Supported Image Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

**Maximum file size:** 5MB

## Troubleshooting

### Images not showing?
1. Check backend is running on port 5000
2. Verify uploads folder exists in backend directory
3. Check browser console for errors

### Upload fails?
1. File size is too large (max 5MB)
2. File format not supported (use JPG, PNG, or GIF)
3. Backend not running or multer not installed

### "Cannot find uploads folder"?
1. The folder is created automatically on first server start
2. If not created, manually create `backend/uploads/` folder

## API Endpoint

**POST** `/api/equipment` (with multipart/form-data)

Form data should include:
- `owner_id` - Your user ID
- `name` - Equipment name
- `description` - Equipment description
- `category` - Equipment category
- `daily_rate` - Daily rental rate
- `image` - Image file (optional, max 5MB)

## Notes

- Images are permanent until equipment is deleted
- Uploading the same image url overwrites the previous one
- For production, consider using cloud storage (AWS S3, Google Cloud Storage, etc.)
