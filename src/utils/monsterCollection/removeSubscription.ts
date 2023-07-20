import axios from "axios";

export async function removeSubscribe(baseUrl: string, address: string) {
  const url = `${baseUrl}/remove-subscribe`;
  const data = { AddressString: address };

  const response = await axios.post(url, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.status !== 200) {
    console.log(`Remove subscribe HTTP error! status: ${response.status}`);
  }
}
