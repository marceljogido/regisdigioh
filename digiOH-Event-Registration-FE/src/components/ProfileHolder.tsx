import { FC } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"

interface ProfileHolderProps {
    email: string;
    imageSrc: string;
}

const ProfileHolder: FC<ProfileHolderProps> = ({ email, imageSrc }) => {

    return (
        <div className="flex items-center space-x-2">
            <Avatar>
                <AvatarImage src={imageSrc} />
                <AvatarFallback>PP</AvatarFallback>
            </Avatar>
            <div className="text-sm truncate font-extrabold pr-2 max-w-[150px]">
                {email}
            </div>
        </div>
    )
}

export default ProfileHolder;
