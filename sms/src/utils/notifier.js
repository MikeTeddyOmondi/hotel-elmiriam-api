const axios = require("axios");

const { MOBITECH_API_KEY, MOBITECH_API_URL } = require("../config");

async function sendSMS(data) {
  // BulkSMS API: MOBITECH_API_URL/sendsms
  // Params
  // Sample JSON data
  // data = {
  //     "mobile": "254702XXXXX",
  //     "response_type": "json",
  //     "sender_name": "23107",
  //     "service_id": 0,
  //     "message": "This is a message.\n\nRegards\nMobiTech Technologies"
  // }

  const response = await axios.post(
    `${MOBITECH_API_URL}`,
    {
      mobile: "254717135176",
      response_type: "json",
      sender_name: "23107",
      service_id: 0,
      message: "OTP: 646903",
    },
    {
      headers: {
        h_api_key: MOBITECH_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  // console.log({ data });
  console.log({ response: response.data[0] });
}

module.exports = { sendSMS };
