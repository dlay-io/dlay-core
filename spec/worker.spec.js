const {expect} = require('chai');
const Worker = require('../lib/worker');

const fixture = {
    "last_seq": "5-g1AAAAIreJyVkEsKwjAURZ-toI5cgq5A0sQ0OrI70XyppcaRY92J7kR3ojupaSPUUgotgRd4yTlwbw4A0zRUMLdnpaMkwmyF3Ily9xBwEIuiKLI05KOTW0wkV4rruP29UyGWbordzwKVxWBNOGMKZhertDlarbr5pOT3DV4gudUC9-MPJX9tpEAYx4TQASns2E24ucuJ7rXJSL1BbEgf3vTwpmedCZkYa7Pulck7Xt7x_usFU2aIHOD4eEfVTVA5KMGUkqhNZV-8_o5i",
    "pending": 0,
    "results": [
        {
            "changes": [
                {
                    "rev": "2-7051cbe5c8faecd085a3fa619e6e6337"
                }
            ],
            "id": "6478c2ae800dfc387396d14e1fc39626",
            "seq": "3-g1AAAAG3eJzLYWBg4MhgTmHgz8tPSTV0MDQy1zMAQsMcoARTIkOS_P___7MSGXAqSVIAkkn2IFUZzIkMuUAee5pRqnGiuXkKA2dpXkpqWmZeagpu_Q4g_fGEbEkAqaqH2sIItsXAyMjM2NgUUwdOU_JYgCRDA5ACGjQfn30QlQsgKvcjfGaQZmaUmmZClM8gZhyAmHGfsG0PICrBPmQC22ZqbGRqamyIqSsLAAArcXo"
        },
        {
            "changes": [
                {
                    "rev": "3-7379b9e515b161226c6559d90c4dc49f"
                }
            ],
            "deleted": true,
            "id": "5bbc9ca465f1b0fcd62362168a7c8831",
            "seq": "4-g1AAAAHXeJzLYWBg4MhgTmHgz8tPSTV0MDQy1zMAQsMcoARTIkOS_P___7MymBMZc4EC7MmJKSmJqWaYynEakaQAJJPsoaYwgE1JM0o1TjQ3T2HgLM1LSU3LzEtNwa3fAaQ_HqQ_kQG3qgSQqnoUtxoYGZkZG5uS4NY8FiDJ0ACkgAbNx2cfROUCiMr9CJ8ZpJkZpaaZEOUziBkHIGbcJ2zbA4hKsA-ZwLaZGhuZmhobYurKAgCz33kh"
        },
        {
            "changes": [
                {
                    "rev": "6-460637e73a6288cb24d532bf91f32969"
                },
                {
                    "rev": "5-eeaa298781f60b7bcae0c91bdedd1b87"
                }
            ],
            "id": "729eb57437745e506b333068fff665ae",
            "seq": "5-g1AAAAIReJyVkE0OgjAQRkcwUVceQU9g-mOpruQm2tI2SLCuXOtN9CZ6E70JFmpCCCFCmkyTdt6bfJMDwDQNFcztWWkcY8JXyB2cu49AgFwURZGloRid3MMkEUoJHbXbOxVy6arc_SxQWQzRVHCuYHaxSpuj1aqbj0t-3-AlSrZakn78oeSvjRSIkIhSNiCFHbsKN3c50b02mURvEB-yD296eNOzzoRMRLRZ98rkHS_veGcC_nR-fGe1gaCaxihhjOI2lX0BhniHaA"
        }
    ]
}

describe('Worker', () => {
    describe('#construct', () => {
        it('without name throws an exception', () => {
            expect(new Worker()).to.throw();
            /*
            new Worker({
                precision: 1000,
                database: 'dlay_tasks',
                hostname: '127.0.0.1',
                name: 'manobi'
                username: 'admin',
                password: 'admin'
            });
            */
        });
    });
});