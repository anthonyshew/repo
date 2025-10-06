use std::env;
use std::process::Command;

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() >= 3 && args[1] == "pr" && args[2] == "print" {
        let only_open = args.contains(&"--only-open".to_string());
        match get_pr_info(only_open) {
            Ok(output) => println!("{}", output),
            Err(e) => println!("{}", e),
        }
    }
}

fn get_pr_info(only_open: bool) -> Result<String, String> {
    // Get all PR URLs for the current user
    let urls_output = Command::new("gh")
        .args(&[
            "pr",
            "list",
            "--author",
            "@me",
            "--json=url",
            "--jq",
            ".[].url",
        ])
        .output()
        .map_err(|e| format!("Failed to execute gh command: {}", e))?;

    if !urls_output.status.success() {
        return Err("Failed to get PR URLs".to_string());
    }

    let urls = String::from_utf8_lossy(&urls_output.stdout);
    let mut results = Vec::new();

    for url in urls.lines() {
        let url = url.trim();
        if url.is_empty() {
            continue;
        }

        // Get PR title and draft status for this URL
        let pr_output = Command::new("gh")
            .args(&["pr", "view", url, "--json", "title,isDraft", "--jq", "{title: .title, isDraft: .isDraft}"])
            .output()
            .map_err(|e| format!("Failed to get PR info: {}", e))?;

        if !pr_output.status.success() {
            continue;
        }

        let pr_info = String::from_utf8_lossy(&pr_output.stdout).trim().to_string();

        // Parse the JSON response
        let is_draft = pr_info.contains("\"isDraft\":true") || pr_info.contains("\"isDraft\": true");
        let title = pr_info
            .split("\"title\":")
            .nth(1)
            .and_then(|s| s.trim_start().strip_prefix('"'))
            .and_then(|s| s.split('"').next())
            .unwrap_or("")
            .to_string();

        // Skip drafts if only_open flag is set
        if only_open && is_draft {
            continue;
        }

        let pr_emoji = if is_draft { ":pr-draft:" } else { ":pr:" };
        results.push(format!("{} [{}]({})", pr_emoji, title, url));
    }

    if results.is_empty() {
        return Err("No open PRs found for this repo. Get to work!".to_string());
    }

    Ok(results.join("\n"))
}
