import axios from "axios";

export default async function handler(req, res) {
    const { destination } = req.query;
    const apiKey = 'AIzaSyD6ueocweqM-JNGouFl-nIE5AFNZBN7png';
    const origin = "5185 Zeeb Rd Dexter, Michigan";
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`;
    try {
      const response = await axios.get(url);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }