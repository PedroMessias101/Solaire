// hooks/useApi.ts
import axios from "axios";
import { API_URL } from "../constants/api";

export const useApi = () => {
  return axios.create({
    baseURL: API_URL,
    timeout: 5000,
  });
};
