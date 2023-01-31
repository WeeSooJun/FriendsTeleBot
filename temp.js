export const handler = async(event) => {
    // TODO implement
    console.log(event)
    const text = event["body"]["message"]["text"];
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};``

export const testInput = {
    "body": {
        "update_id": 163246526,
        "message": {
            "message_id": 123,
            "from": {
                "id": 123456789,
                "is_bot": false,
                "first_name": "Bob",
                "last_name": "The Builder",
                "username": "BobTheBuilder"
            },
            "chat": {
                "id": -1234567891234,
                "title": "FriendsTeleBot",
                "type": "supergroup"
            },
            "date": 1673537758,
            "text": "/thisShouldWorkNow",
            "entities": [
                {
                    "offset": 0,
                    "length": 18,
                    "type": "bot_command"
                }
            ]
        }
    }
};

handler(input);