# Sunset (Maghrib) across Sweden on 6 Nov 2026, NOAA solar equations, local time CET (UTC+1).
import math, json, sys
import numpy as np
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
def sun_event(lat, lon, jd_day, zenith=90.833, rise=False):
    # jd_day: Julian day number at 0h UT of the date
    n = math.ceil(jd_day - 2451545.0 + 0.0008)
    Jstar = n - lon/360.0
    M = (357.5291 + 0.98560028*Jstar) % 360
    C = 1.9148*math.sin(math.radians(M)) + 0.02*math.sin(math.radians(2*M)) + 0.0003*math.sin(math.radians(3*M))
    lam = (M + C + 180 + 102.9372) % 360
    Jtransit = 2451545.0 + Jstar + 0.0053*math.sin(math.radians(M)) - 0.0069*math.sin(math.radians(2*lam))
    dec = math.asin(math.sin(math.radians(lam))*math.sin(math.radians(23.4397)))
    cosw = (math.cos(math.radians(zenith)) - math.sin(math.radians(lat))*math.sin(dec))/(math.cos(math.radians(lat))*math.cos(dec))
    if cosw > 1 or cosw < -1: return None
    w = math.degrees(math.acos(cosw))
    J = Jtransit + (-w if rise else w)/360.0
    frac = (J + 0.5) % 1.0          # fraction of the UT day
    return (frac*24 + 1) % 24        # CET
jd = 2461350.5  # 6 Nov 2026 00:00 UT
lons = np.linspace(10.5, 24.5, 120); lats = np.linspace(55.0, 69.5, 140)
Z = np.array([[sun_event(la, lo, jd) or np.nan for lo in lons] for la in lats])
for name, lo, la in [('Malmö',13.0,55.6),('Göteborg',11.97,57.71),('Stockholm',18.07,59.33),('Umeå',20.26,63.83),('Kiruna',20.22,67.86),('Luleå',22.15,65.58)]:
    t = sun_event(la, lo, jd); print(name, f'{int(t)}:{int(round((t%1)*60)):02d}')
levels = [14 + 10*i/60 for i in range(0, 19)]  # every 10 minutes 14:00..17:00
cs = plt.contour(lons, lats, Z, levels=levels)
out = []
for lev, segs in zip(cs.levels, cs.allsegs):
    for s in segs:
        if len(s) > 3: out.append({'t': float(lev), 'pts': [[float(a), float(b)] for a, b in s[::2]]})
json.dump(out, open(sys.argv[1], 'w'))
print(len(out), 'lines')
# Fajr: the sun 18 degrees below the horizon before sunrise (MWL)
ZF = np.array([[sun_event(la, lo, jd, zenith=108, rise=True) or np.nan for lo in lons] for la in lats])
plt.figure()
cs2 = plt.contour(lons, lats, ZF, levels=[5 + 10*i/60 for i in range(0, 24)])
out2 = []
for lev, segs in zip(cs2.levels, cs2.allsegs):
    for s in segs:
        if len(s) > 3: out2.append({'t': float(lev), 'pts': [[float(a), float(b)] for a, b in s[::2]]})
json.dump(out2, open(sys.argv[1].replace('maghrib', 'fajr'), 'w'))
for name, lo, la in [('Malmö',13.0,55.6),('Stockholm',18.07,59.33),('Kiruna',20.22,67.86)]:
    t = sun_event(la, lo, jd, zenith=108, rise=True); print('fajr', name, f'{int(t)}:{int(round((t%1)*60)):02d}')
