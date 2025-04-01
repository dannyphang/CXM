import { supabase } from "../configuration/supabase.js";

function createProperty({ property }) {
  return new Promise(async (resolve, reject) => {
    try {
      const { data, error } = await supabase.from("properties").insert([property]).select();

      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    } catch (error) {
      reject(error);
    }
  });
}

export { createProperty };
