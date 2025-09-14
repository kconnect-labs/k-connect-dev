import { useEffect, useState } from 'react';
import { useWebSocket } from '../../../../System/Context/WebSocket';
import { Avatar } from '../../../../UIKit';

const GroupMembers = ({ groupID }) => {
    const { wsClient } = useWebSocket();
    const [members, setMembers] = useState([]);

    useEffect(() => {
        wsClient.send({
            type: 'messenger',
            action: 'load_group_members',
            gid: groupID
        }).then((res) => {
            if (res.status === 'success') {
                setMembers(res.members);
            }
        })
    }, []);

    return (
        <div className="GroupMembers">
            {members.map((user: any) => (
                <div
                    key={user.id}
                    className="Member"
                >
                    <Avatar
                        avatar={user.avatar}
                        name={user.name}
                    />
                    <div className="Name">
                        {user.name}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default GroupMembers;