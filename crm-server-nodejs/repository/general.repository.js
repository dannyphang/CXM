import { supabase } from "../configuration/supabase.js";

function getLanguage() {
  return new Promise(async (resolve, reject) => {
    try {
      const { data, error } = await supabase.from("language").select("*").eq("statusId", 1);
      if (error) {
        if (!data) {
          reject("Data not found");
        }
        reject(error);
      } else {
        resolve(data);
      }
    } catch (error) {
      reject(error);
    }
  });
}

export { getLanguage };
