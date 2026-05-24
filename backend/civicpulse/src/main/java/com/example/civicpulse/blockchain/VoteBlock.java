package com.example.civicpulse.blockchain;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vote_block")
public class VoteBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "block_id")
    private String blockId;

    private String previousHash;
    private String hash;
    private long timestamp;
    private int voteCount = 0;
    private boolean sealed = false;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "vote_block_voter_hashes", joinColumns = @JoinColumn(name = "vote_block_block_id"))
    @Column(name = "voter_hashes")
    private List<String> voterHashes = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "vote_block_candidate_ids", joinColumns = @JoinColumn(name = "vote_block_block_id"))
    @Column(name = "candidate_ids")
    private List<String> candidateIds = new ArrayList<>();

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
