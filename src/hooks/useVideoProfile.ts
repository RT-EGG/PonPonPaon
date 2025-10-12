interface ProfileIndex {}

export interface VideoProfile {
    lastAccessDate: Date;
    filePath: string;
}

export const useVideoProfile = () => {
    const getProfileFileName = async (filePath: string) => {
        const meta = await window.files.loadFileMeta(filePath);
        return `${meta.size}-${Math.trunc(meta.mtimeMs)}.json`;
    };

    const loadProfile = async (filePath: string) => {
        filePath = filePath.replace("/", "\\");
        const loadFile: (path: string) => VideoProfile = async (
            path: string
        ) => {
            const fileName = await getProfileFileName(filePath);
            const directory = await window.files.getUserDataPath();
            const profileFilePath = `${directory}\\profiles\\${fileName}`;
            console.log(profileFilePath);
            if (!(await window.files.exists(profileFilePath))) {
                return {
                    lastAccessDate: Date.now(),
                    filePath: path,
                };
            }

            const file = (await window.files.readFile(
                profileFilePath
            )) as string;
            return JSON.parse(file) as VideoProfile;
        };

        let profile = loadFile(filePath);
    };

    return {
        loadProfile,
    };
};
