import mongoose from 'mongoose';

const testConnection = async () => {
    try {
        const uri = 'mongodb+srv://kdhanunjaya:dhanu2704@cluster0.wfnpa3l.mongodb.net/spend_log?retryWrites=true&w=majority';
        await mongoose.connect(uri);
        console.log('✅ MongoDB Connected Successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message);
        process.exit(1);
    }
};

testConnection();