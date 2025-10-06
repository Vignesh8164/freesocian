// Utility functions for file upload handling

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Please select a JPG, PNG, or GIF image file.' };
  }

  // Check file size (2MB = 2 * 1024 * 1024 bytes)
  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 2MB.' };
  }

  return { valid: true };
};

export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const openFileDialog = (
  accept: string = 'image/jpeg,image/jpg,image/png,image/gif'
): Promise<File | null> => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.style.display = 'none';
    
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0] || null;
      document.body.removeChild(input);
      resolve(file);
    };
    
    input.oncancel = () => {
      document.body.removeChild(input);
      resolve(null);
    };
    
    document.body.appendChild(input);
    input.click();
  });
};

// Mock function to simulate file upload to backend (Appwrite/server)
export const uploadImageToBackend = async (file: File): Promise<string> => {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // In a real app, this would upload to your backend storage
  // For now, we'll return a mock URL
  return `https://api.example.com/uploads/${Date.now()}-${file.name}`;
};