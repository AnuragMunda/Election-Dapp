/*--------- TEST FOR THE ELECTION CONTRACT ---------*/

const Election = artifacts.require("Election");

// Declaring Election contract test
contract("Election", (accounts) => {

    let [candidate1, candidate2, voter1, voter2, voter3] = accounts; // Accounts to be used for testing.
    let election;

    // This gets executed before each test run
    beforeEach(async () => {
        election = await Election.new(); // Instance of the Election contract
    })

    // Test for Registering a candidate
    it("should register a candidate", async () => {
        const result = await election.candidateRegistration("Anurag", "BJP", { from: candidate1 })
        assert.equal(result.receipt.status, true)
        assert.equal(result.logs[0].args.name, "Anurag")
        assert.equal(result.logs[0].args.party, "BJP")
    })

    // Test for Registering a voter
    it("should register a voter", async () => {
        const result = await election.voterRegistration({ from: voter1 })
        try {
            await election.voterRegistration({ from: voter1 })
        }
        catch (err) {
            assert.equal(result.receipt.status, true)
            assert.equal(result.logs[0].args._address, voter1)
            return
        }
        assert(false, "The contract did not throw")
    })

    // Test for voting
    it("should let a voter vote a candidate only once", async () => {
        await election.candidateRegistration("Anurag", "BJP", { from: candidate1 })
        await election.voterRegistration({ from: voter1 })
        const result = await election.Vote(1, { from: voter1 })
        assert.equal(result.logs[0].args.candidateId, 1)
        console.log(result.logs[0].args.msg)

        try {
            await election.Vote(1, { from: voter1 })
        }
        catch (err) {
            return
        }
        assert(false, "Voter can vote only once")
    })

    // Test for declaring a winner
    it("should return a winner", async () => {
        await election.candidateRegistration("Anurag", "BJP", { from: candidate1 })
        await election.candidateRegistration("Munda", "Congress", { from: candidate2 })
        await election.voterRegistration({ from: voter1 })
        await election.voterRegistration({ from: voter2 })
        await election.voterRegistration({ from: voter3 })
        await election.Vote(1, { from: voter1 })
        await election.Vote(2, { from: voter2 })
        await election.Vote(1, { from: voter3 })

        const winner = await election.declareWinner();
        assert.equal(winner._name, "Anurag")
        assert.equal(winner._party, "BJP")
        assert.equal(winner._address, candidate1)
    })

})