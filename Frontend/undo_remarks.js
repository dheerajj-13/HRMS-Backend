
const fs = require('fs');
const path = require('path');

const backups = [
    { original: 'src/pages/ProjectManager/LeaveManagement.tsx', backup: 'src/pages/ProjectManager/LeaveManagement.backup_remarks.tsx' },
    { original: 'src/pages/LeaveApplication.tsx', backup: 'src/pages/LeaveApplication.backup_remarks.tsx' }
];

backups.forEach(({ original, backup }) => {
    const backupPath = path.resolve(backup);
    const originalPath = path.resolve(original);

    if (fs.existsSync(backupPath)) {
        console.log(`Restoring ${original} from remarks backup...`);
        fs.copyFileSync(backupPath, originalPath);
    } else {
        console.warn(`Backup not found for ${original}`);
    }
});

console.log("Manager remarks feature undone.");
