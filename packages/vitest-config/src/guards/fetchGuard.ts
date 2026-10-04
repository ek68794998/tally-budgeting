/**
 * Logs a console error by replacing a call to `fetch`. This is used to fail
 * any test that opens a real HTTP connection.
 *
 * Notably, using this helps prevent any kind of aggregated `ECONNREFUSED` errors.
 */
const explainUnmockedFetch = (input: RequestInfo | URL): Promise<never> => {
  const url = input instanceof Request ? input.url : input.toString();

  console.error(
    `Unmocked fetch call to "${url}". Mock the relevant API layer for this test instead of hitting the network.`,
  );

  return Promise.reject(new Error(`Unmocked fetch call to "${url}"`));
};

export default explainUnmockedFetch;
