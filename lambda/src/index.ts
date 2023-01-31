import { sendMessage } from "./SendMessage";

const testInput = {
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

export const handler =  async function(event: any) {
    console.log("EVENT: \n" + JSON.stringify(event, null, 2))
    const text = event["body"]["message"]["text"];
    const command = userInputHandler(text);
    console.log(command);
    sendMessage();
    return {
        statusCode: 200,
        body: "Hello, Pulumi!"
    };
  }

function userInputHandler(text: string) {
    const withoutSlash = text.substring(1);
    const inputArray = withoutSlash.split(" ");

    return inputArray[0];
}

handler(testInput);
