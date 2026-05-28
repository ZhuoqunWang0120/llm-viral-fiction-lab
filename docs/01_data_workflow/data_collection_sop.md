# Data Collection SOP

1. Run `npm run login` and complete login manually.
2. Use dry-run before collection.
3. Start with small batches: 1-3 posts, then 5, then 10 only if no warnings appear.
4. Stop immediately on CAPTCHA, login challenge, access restriction, abnormal traffic, blank/error pages, or risk-control signals.
5. Keep raw outputs local.
6. Convert only the local files needed for analysis.

Precise archival mode:

```sh
npm run collect -- --start 7 --end 9 --max-posts 3
```

Sample mode:

```sh
npm run collect -- --sample-mode --sample-query "芭比汤淇 顶级金丝雀的恨海情天" --dry-run --max-candidates 30
npm run collect -- --sample-mode --sample-query "芭比汤淇 顶级金丝雀的恨海情天" --max-candidates 30 --max-posts 3
```
