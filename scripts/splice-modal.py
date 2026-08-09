with open('/home/z/my-project/src/app/page.tsx', 'r') as f:
    content = f.read()

with open('/home/z/my-project/scripts/new-modal.tsx', 'r') as f:
    new_modal = f.read()

start_marker = '/* ---------- Project Form Modal ---------- */'
start_idx = content.index(start_marker)

end_marker = '\n/* ---------- Admin Testimonials Tab ---------- */'
end_idx = content.index(end_marker)

content = content[:start_idx] + new_modal + '\n' + content[end_idx:]

with open('/home/z/my-project/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Modal spliced in successfully')