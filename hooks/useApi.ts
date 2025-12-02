<<<<<<< HEAD
import axios from "axios";
import { API_URL } from "../constants/api";
 
=======
// hooks/useApi.ts
import axios from "axios";
import { API_URL } from "../constants/api";

>>>>>>> 45a7f2fbca08a32445235bff760a1648d334cf9b
export const useApi = () => {
  return axios.create({
    baseURL: API_URL,
    timeout: 5000,
  });
<<<<<<< HEAD
};
=======
};
>>>>>>> 45a7f2fbca08a32445235bff760a1648d334cf9b
