import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from root .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const Authenticate = (req, res, next) => {
    const { key } = req.headers;
    // console.log('Authenticating request... Key: ', key);
    if (!key || process.env.KEY != key) {
        console.log('Authentication failed');
        return res.status(401).json({ msg: "not Authorization" });
    }

    next();
}

export default Authenticate;