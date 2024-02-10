/**
 * Parses the given query object to be used in Mongo query API.
 * @param {object} queryObj The query object to parse
 * @returns {object} Parsed object valid for Mongo query API.
 */
export const parseMongoQuery: (queryObj: { [key: string]: string }) => {
  [key: string]: string;
} = (queryObj) => {
  // convert id to _id
  if (queryObj['id']) {
    queryObj['_id'] = queryObj['id'];
    delete queryObj['id'];
  }

  return queryObj;
};
