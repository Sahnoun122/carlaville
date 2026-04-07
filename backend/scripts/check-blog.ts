import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const BlogSchema = new Schema({
  title: String,
  slug: String,
  excerpt: String,
  content: String,
  published: Boolean,
});

async function run() {
  // Try to find the connection string in .env if it exists, otherwise use default
  const uri = 'mongodb://127.0.0.1:27017/carlaville'; // Adjust based on common defaults
  
  try {
    const conn = await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    
    const BlogModel = mongoose.model('Blog', BlogSchema);
    
    const idToFind = '69ce1afd369eb06349047245';
    const blog = await BlogModel.findById(idToFind);
    
    if (blog) {
      console.log('Found Blog:', blog);
    } else {
      console.log('Blog NOT found by ID:', idToFind);
    }
    
    const allSlugs = await BlogModel.find({}, 'slug title');
    console.log('All existing slugs:', allSlugs);
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
