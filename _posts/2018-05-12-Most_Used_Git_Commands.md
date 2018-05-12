---
layout: post
title: My Most Used Git Commands
comments: false
---

My Most Used Git Commands

A lot of these commans come from using Github with the [Zephyr
Project](https://www.zephyrproject.org/).

# Delete a Remote Branch

I have had to look this one up way too many times.

{% highlight shell %}
$ git push <remote> --delete <branch>
{% endhighlight %}

# ~~Squanching~~ Squashing

I use squashing just before I put a pull request on upstream as a PR.
Sometimes my branches are small and I can just keep using `commit --amend`.
However, if I am working on a large feature/bug-fix I want to have
intermediate checkpoints (commits). I don't want all those intermediate
branches polluting upstream. So just before creating the pull request I will
squash all the changes down into one glorious commit.

{% highlight shell %}
$ git rebase -i HEAD~<N>
{% endhighlight %}

In the above command, N should be replaced with how many commits you want to
squash together. For example if I have 2 commits that I want to squash into
1, I will use `HEAD~2`.

Notice how the commits are listed from top to bottom in oldest to earliest, which
is the reverse of `git log`. Leave the first commit (the top commit) set to __pick__.
Replace the word pick with __squash__ for all the commits below it.

# Updating your Branch

This one is for when I am working on a feature or bug fix. Let's say it took
me 2 weeks to fix. Now I need to update my branch to what is the current
master so that my branch can be directly merged.

{% highlight shell %}
$ git pull --rebase upstream master
{% endhighlight %}

# Grabbing a Pull Request

I have to look this one up to often on Github as well. Some people don't
realize you can call the branch whatever you want locally.

{% highlight shell %}
$ git fetch origin pull/ID/head:<local branch name>
{% endhighlight %}

# Show me the files changed in my history

This is to show which files were changed when you run the `log` command. The
option `--stat` is what gives the information seeked.

{% highlight shell %}
$ git log -1 --stat
{% endhighlight %}

# Stash kung fu

The only paragraph you need for being a stash master.

View your stash with `stash list`. If you want the changes in a stash to
be applied to your current branch execute `stash apply "stash{N}"`. Don't
forget the quotes! The `apply` command will leave the changes in your stash
still so you could apply it to other branches or just be saving it. If you
want to apply and delete execute `git stash pop "stash{N}"`. If you want to
just delete the stashed changes execute `stash drop "stash{N}"`.
