import { UsersIcon } from '@heroicons/react/24/outline';
import ProfileHolder from "./ProfileHolder";
const ProfPicTemplate = require("../assets/profile-template.svg").default as string;

const ProfileList = () => {
    const users = [
        { email: "user1@example.com", imageSrc: "https://github.com/shadcn.png" },
        { email: "user2@example.com", imageSrc: "https://github.com/shadcn.png" },
        { email: "user3@example.com", imageSrc: "https://github.com/shadcn.png" },
        { email: "user4@example.com", imageSrc: "https://github.com/shadcn.png" },
        // { email: "user1@example.com", imageSrc: "https://github.com/shadcn.png" },
        // { email: "user2@example.com", imageSrc: "https://github.com/shadcn.png" },
        // { email: "user3@example.com", imageSrc: "https://github.com/shadcn.png" },
        // { email: "user4@example.com", imageSrc: "https://github.com/shadcn.png" },
    ];

    return (
        <div className="bg-white p-5 space-y-5 rounded-l-3xl h-[30rem] w-full">
            <div>
                <div className='flex items-center'>
                    <UsersIcon className="h-6 w-6 mr-2" />
                    <h2 className="text-xl font-bold">List of Users</h2>
                </div>
                <hr className="my-2 border-t-2 border-gray-200" />
            </div>
            <div className="overflow-y-auto h-[23rem] rounded-l-3xl space-y-5 truncate max-w-[150px]">
                {users.map((user, index) => (
                    <ProfileHolder key={index} email={user.email} imageSrc={ProfPicTemplate} />
                ))}
            </div>
        </div>
    );
};

export default ProfileList;
