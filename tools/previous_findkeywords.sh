#!/bin/bash

display_usage() { 
	echo "To use with wozacosta/allScrobbles.js once it has fetched all scrobbles in a .json file" 
	echo -e "\nUsage:\n$0 file word1 [word2 ...]\n\twords1, word2, etc.: separate word searches on your json file\n" 
} 
# if less than two arguments supplied, display usage 
if [  $# -le 1 ] 
then 
	display_usage
	exit 1
fi 

#http://stackoverflow.com/questions/3427872/whats-the-difference-between-and-in-bash
# [ and [[

# check whether user had supplied -h or --help . If yes display usage 
if [[ ( $@ == "--help") ||  $@ == "-h" ]] 
then 
	display_usage
	exit 0
fi 

FILE=$1

# $1 <--- $2, $2 <--- $3, $3 <--- $4, etc.
# The old $1 disappears, but $0 (the script name) does not change. 
# If you use a large number of positional parameters to a script, shift lets you access those past 10, although {bracket} notation also permits this.
shift

while test ${#} -gt 0
do
	echo "Processing $1 in $FILE"
	cat $FILE | pcregrep --colour --om-separator=":" -iM -o1 -o2 "\]\W(\d{1,})\W\[.*?([^{]*?$1.*?)\}" \
		| awk -F"\"" '{print $1 $4 $7  $8 $11 $12}' | column -t -s ":" | grep -i --color=always $1

	shift
	echo "\n--------------------------------------------\n"
done


