import re

with open('/home/z/my-project/src/app/page.tsx', 'r') as f:
    content = f.read()

# Fix escaped template literals - replace escaped backtick-dollar-brace patterns
# Pattern: \"\${...}\"  ->  `${...}`

# Fix textarea className
content = content.replace('{\"\\$\\{adminInputCls\\} resize-none\"}', '`${adminInputCls} resize-none`')

# Fix URL input className
content = content.replace('{\"\\$\\{adminInputCls\\} flex-1 text-xs\"}', '`${adminInputCls} flex-1 text-xs`')

# Fix dragOver className  - find the exact broken string
old_drag = '"relative border-2 border-dashed rounded-xl px-4 py-6 text-center cursor-pointer transition-all \\$\\{dragOver ? "border-[#C9A84C] bg-[rgba(201,168,76,0.08)]" : "border-[rgba(201,168,76,0.2)] hover:border-[rgba(201,168,76,0.4)]"\"}'
new_drag = '`relative border-2 border-dashed rounded-xl px-4 py-6 text-center cursor-pointer transition-all ${dragOver ? "border-[#C9A84C] bg-[rgba(201,168,76,0.08)]" : "border-[rgba(201,168,76,0.2)] hover:border-[rgba(201,168,76,0.4)]"}`'

# Just use regex to fix all the patterns
# Replace \"\${...}\" with `${...}`
content = re.sub(r'\\"(\\\\\$\\\{[^}]+\\\})\\"', r'`
1`', content)

# Actually, let me just find and replace the specific broken patterns by reading the lines
lines = content.split('\n')
for i, line in enumerate(lines):
    # Fix any line containing \$\{  ->  ${
    if '\\$\\{' in line:
        lines[i] = line.replace('\\$\\{', '${')
    # Fix any line containing \" that should be backtick
    # The pattern is className={\"...\"} which should be className={`...`}
    if '{\\"' in line and '\\$' in line:
        lines[i] = lines[i].replace('{\\"', '{`').replace('\\"}', '`}')

content = '\n'.join(lines)

# Specific fixes for remaining issues
content = content.replace('{\"Image \\' + '$' + '\\{i+1\\}\"}', '`Image ${i+1}`')

with open('/home/z/my-project/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Done')