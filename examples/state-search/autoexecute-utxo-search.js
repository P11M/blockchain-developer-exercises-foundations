// NOTE: You need to have a .env.enc file in the root directory where you are running the node command

const log4js = require("log4js");
const OverledgerBundle = require("@quantnetwork/overledger-bundle");
const OverledgerTypes = require("@quantnetwork/overledger-types");

const OverledgerSDK = OverledgerBundle.default;
const courseModule = "utxo-state-search";
const { DltNameOptions } = OverledgerTypes;

const log = log4js.getLogger(courseModule);

// Initialize log
log4js.configure({
  appenders: {
    console: { type: "console" },
  },
  categories: {
    default: { appenders: ["console"], level: "debug" },
  },
});

log.info("Loading password passed in via the command line");
const PASSWORD_INPUT = process.argv.slice(2).toString();
const SENV_PASSWORD = PASSWORD_INPUT.split("=")[1];

// Check for provided password for the secure env
if (!SENV_PASSWORD) {
  log.error(
    "Please insert a password to decrypt the secure env file. Example: \n node examples/state-search/autoexecute-utxo-search.js password=MY_PASSWORD",
  );
  throw new Error(
    "Please insert a password to decrypt the secure env file. Example: \n node examples/state-search/autoexecute-utxo-search.js password=MY_PASSWORD",
  );
}
log.info("Executing ", courseModule);
(async () => {
  try {
    log.info("Initializing the SDK");
    const overledger = new OverledgerSDK({
      dlts: [
        { dlt: DltNameOptions.BITCOIN },
        { dlt: DltNameOptions.ETHEREUM },
        { dlt: DltNameOptions.XRP_LEDGER },
      ], // connects OVL to these 3 technologies
      userPoolID: "us-east-1_xfjNg5Nv9", // where your userpool id is located
      provider: { network: "https://api.sandbox.overledger.io/v2" }, // URL for the testnet versions of these DLTs
      envFilePassword: SENV_PASSWORD,
    });

    log.info("Obtaining the Access Token to Interact with Overledger");
    const refreshTokensResponse =
      await overledger.getTokensUsingClientIdAndSecret(
        process.env.USER_NAME,
        process.env.PASSWORD,
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
      );

    log.info(
      "Creating the Overledger Request Object with the Correct Location",
    );
    const overledgerRequestMetaData = {
      location: {
        technology: "Bitcoin",
        network: "Testnet",
      },
    };
    const overledgerInstance = overledger.provider.createRequest(
      refreshTokensResponse.accessToken.toString(),
    );

    log.info(`Asking Overledger for the Specific Block`);
    overledgerBlockResponse = await overledgerInstance.post(
      `/autoexecution/search/block/2164734`,
      overledgerRequestMetaData,
    );
    const transactionsInBlock =
      overledgerBlockResponse.data.executionBlockSearchResponse.block
        .numberOfTransactions - 1;
    log.info(
      `Transactions in Block = ${overledgerBlockResponse.data.executionBlockSearchResponse.block.numberOfTransactions}`,
    );

    // check for your transaction

        // query Overledger for this transaction
        overledgerTransactionResponse = await overledgerInstance.post(
          `/autoexecution/search/transaction?transactionId=54a6739234dcc42dd490b0a7fc53123d1219f9507863fc4a4ca803bf06e77660`,
          overledgerRequestMetaData,
        );
        utxoCount =
          overledgerTransactionResponse.data.executionTransactionSearchResponse
            .transaction.destination.length - 1;
        log.info(
          `This Transaction has ${overledgerTransactionResponse.data.executionTransactionSearchResponse.transaction.destination.length} destinations`,
        );
          log.info(
            `Asking Overledger for UTXO in Transaction `,
          );
     utxoId = `54a6739234dcc42dd490b0a7fc53123d1219f9507863fc4a4ca803bf06e77660:2`;
          overledgerUTXOResponse = await overledgerInstance.post(
            `/autoexecution/search/utxo/${utxoId}`,
            overledgerRequestMetaData,
          );
          utxoStatus =
            overledgerUTXOResponse.data.executionUtxoSearchResponse.status.code;
          log.info(`The UTXO has a status of ${utxoStatus}`);
          if (utxoStatus === "UNSPENT_SUCCESSFUL") {
            thisUtxoAmount =
              overledgerUTXOResponse.data.executionUtxoSearchResponse
                .destination[0].payment.amount;
    }
  } catch (e) {
    log.error("error", e);
  }
})();
