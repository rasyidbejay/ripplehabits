# Recommended branch protection settings for `main`

Apply these settings in **Repository Settings → Branches → Add branch protection rule**:

1. **Branch name pattern**: `main`
2. ✅ Require a pull request before merging
   - ✅ Require approvals: `1` or more
   - ✅ Dismiss stale pull request approvals when new commits are pushed
3. ✅ Require status checks to pass before merging
   - Required check: `build-and-deploy`
4. ✅ Require branches to be up to date before merging
5. ✅ Block force pushes
6. ✅ Block branch deletion
7. (Optional) ✅ Require signed commits
8. (Optional) ✅ Include administrators

These defaults protect production history while keeping team velocity high.
