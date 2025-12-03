/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onCall} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import axios from "axios";

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({maxInstances: 10});

export const searchBooks = onCall({secrets: ["GOOGLE_BOOKS_KEY"]},
  async (request) => {
    const query = request.data.query;
    if (!query) {
      throw new Error("Debes enviar un término de búsqueda.");
    }

    const apiKey = process.env.GOOGLE_BOOKS_KEY;

    try {
      const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${apiKey}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      logger.error("Error buscando libros", error);
      throw new Error("Error al conectar con Google Books");
    }
  });
