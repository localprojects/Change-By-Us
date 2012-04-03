#!/usr/bin/env python
import sys
from daemonwatch import *

def run_monitor(url=None):
	
	Monitor(
		Service(
			name="cbu-ensure-up",
			monitor=(
				HTTP(
					GET=url,
					freq=Time.ms(5000),
					fail=[
						Incident(
							errors=1,
							during=Time.s(5),
							actions=[
								Print("%s experienced an error")
							]
						),
						Incident(
							errors=2,
							during=Time.s(10),
							actions=[
								Print("%s experienced 2 errors within 10 seconds")
							]
						)
					]
				)
			)
		)
	).run()

if len(sys.argv) == 1:
	sys.exit("Please specify a URL (be sure to include a trailing slash): python monitor.py http://yourhost/")

run_monitor(sys.argv[1])