import base64
import sys

# We will read from stdin and write to the target file
if len(sys.argv) < 2:
    print("Usage: python writer.py <output_file>")
    sys.exit(1)

out_file = sys.argv[1]
print("Reading base64 from stdin...")
b64_data = sys.stdin.read().replace('\n', '').replace('\r', '').replace(' ', '')
try:
    decoded = base64.b64decode(b64_data).decode('utf-8')
    with open(out_file, 'w', encoding='utf-8') as f:
        f.write(decoded)
    print("Successfully wrote to", out_file)
except Exception as e:
    print("Error:", e)
