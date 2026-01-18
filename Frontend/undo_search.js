
const fs = require('fs');
const path = require('path');

const backups = [
    { original: 'src/pages/ProjectManager/LeaveManagement.tsx', backup: 'src/pages/ProjectManager/LeaveManagement.backup_search.tsx' },
];

backups.forEach(({ original, backup }) => {
    const backupPath = path.resolve(backup);
    const originalPath = path.resolve(original);

    if (fs.existsSync(backupPath)) {
        console.log(`Restoring ${original} from search backup...`);
        fs.copyFileSync(backupPath, originalPath);
    } else {
        console.warn(`Backup not found for ${original}`);
    }
});

console.log("Manager search/filter feature undone.");
