import axios from "axios";

export default async function handler(req, res) {
    const { waypoints } = req.query;
    const destination = "5185 Zeeb Rd";
    const apiKey = 'AIzaSyD6ueocweqM-JNGouFl-nIE5AFNZBN7png';
    const origin = "5185 Zeeb Rd Dexter";
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&waypoints=optimize:true|${waypoints}&key=${apiKey}`;
    try {
      const response = await axios.get(url);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }