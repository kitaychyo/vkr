def parse(s):
    s = s.split("?")[1]
    s = s.split("&")
    res = {}
    for i in s:
        s1 = i.split("=")
        res[f"{s1[0]}"] = s1[1]
    return res

print(parse("sdasd?q=1&s=2"))
