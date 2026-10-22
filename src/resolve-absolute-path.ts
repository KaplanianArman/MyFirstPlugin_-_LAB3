import * as path from 'path';

export function GetAbsolutePath(files: Set<string>, include_file_path: string, 
                        cur_file_path: string, root: string): string | undefined {

    const from_file_dir = path.resolve(path.dirname(cur_file_path), include_file_path);
    if (files.has(from_file_dir)) {
        return from_file_dir;
    }

    const from_root = path.resolve(root, include_file_path);
    if (files.has(from_root)) {
        return from_root;
    }

    return undefined;
}