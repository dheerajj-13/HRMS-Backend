import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backups = [
    {
        original: path.join(__dirname, 'src/pages/LeaveApplication.tsx'),
        backup: path.join(__dirname, 'src/pages/LeaveApplication.backup_calendar.tsx'),
    }
];

backups.forEach(({ original, backup }) => {
    if (fs.existsSync(backup)) {
        fs.copyFileSync(backup, original);
        console.log(`Restored ${original} from ${backup}`);
    } else {
        console.error(`Backup not found for ${original}: ${backup}`);
    }
});

console.log("Undo complete: Calendar View removed.");
