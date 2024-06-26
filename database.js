import * as fs from 'fs';
import * as path from 'path';

export function createDB() {
    const curPath = path.join('./DB', 'database.json');
    if (fs.existsSync(curPath)) {
        return;
    }
    fs.writeFileSync(curPath, '{}');
}