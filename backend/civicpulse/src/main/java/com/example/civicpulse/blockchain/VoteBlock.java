package com.example.civicpulse.blockchain;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class VoteBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String blockId;

    private String previousHash;
    private String hash;

    private long timestamp;

    private int voteCount = 0;

    private boolean sealed = false;

    // Store hashed voter identities (NOT raw voterId)
    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> voterHashes = new ArrayList<>();

    // Store candidate votes inside block
    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> candidateIds = new ArrayList<>();

    // getters & setters

    public String getBlockId() {
        return blockId;
    }

    public void setBlockId(String blockId) {
        this.blockId = blockId;
    }

    public String getPreviousHash() {
        return previousHash;
    }

    public void setPreviousHash(String previousHash) {
        this.previousHash = previousHash;
    }

    public String getHash() {
        return hash;
    }

    public void setHash(String hash) {
        this.hash = hash;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public int getVoteCount() {
        return voteCount;
    }

    public void setVoteCount(int voteCount) {
        this.voteCount = voteCount;
    }

    public boolean isSealed() {
        return sealed;
    }

    public void setSealed(boolean sealed) {
        this.sealed = sealed;
    }

    public List<String> getVoterHashes() {
        return voterHashes;
    }

    public void setVoterHashes(List<String> voterHashes) {
        this.voterHashes = voterHashes;
    }

    public List<String> getCandidateIds() {
        return candidateIds;
    }

    public void setCandidateIds(List<String> candidateIds) {
        this.candidateIds = candidateIds;
    }
}