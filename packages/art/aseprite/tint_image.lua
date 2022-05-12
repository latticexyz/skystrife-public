-- Tint Aseprite Image

function rgbToHsl(r, g, b, a)
  r, g, b = r / 255, g / 255, b / 255

  local max, min = math.max(r, g, b), math.min(r, g, b)
  local h, s, l

  l = (max + min) / 2

  if max == min then
    h, s = 0, 0 -- achromatic
  else
    local d = max - min
    local s
    if l > 0.5 then s = d / (2 - max - min) else s = d / (max + min) end
    if max == r then
      h = (g - b) / d
      if g < b then h = h + 6 end
    elseif max == g then
      h = (b - r) / d + 2
    elseif max == b then
      h = (r - g) / d + 4
    end
    h = h / 6
  end

  return h, s, l, a or 255
end

function getFilenameFromPath(path)
  return path:match("([^/]+)$")
end

function multiplyRgb(r1, g1, b1, r2, g2, b2)
  -- divide all by 255
  r1, g1, b1 = r1 / 255, g1 / 255, b1 / 255
  r2, g2, b2 = r2 / 255, g2 / 255, b2 / 255

  -- multiply together
  local r3 = r1 * r2
  local g3 = g1 * g2
  local b3 = b1 * b2

  -- then multiply result by 255
  r3, g3, b3 = r3 * 255, g3 * 255, b3 * 255

  -- rounding to ensure whole numbers
  r3, g3, b3 = math.floor(r3 + 0.5), math.floor(g3 + 0.5), math.floor(b3 + 0.5)

  return r3, g3, b3
end

function rgbFromColorString(colorString)
  local r, g, b = colorString:match("(%d+),(%d+),(%d+)")
  return { tonumber(r), tonumber(g), tonumber(b) }
end

local filePath = app.params["filepath"]
if not filePath then
  print("There is no file path")
end

local outPath = app.params["outpath"]
if not outPath then
  print("There is no out path")
end

local colorString = app.params["color"] -- comma separated rgb values
if not colorString then
  print("There is no color")
end

local colorRgb = rgbFromColorString(colorString)
local sprite = app.open(filePath)
if not sprite then
  print("There is no sprite")
end

-- delete all frames except the first
-- aseprite is automatically opening every frame in the animation at once
-- we only want one frame at a time
if (#sprite.frames > 1) then
  for i = 2, #sprite.frames - 1, 1 do
    -- pcall is needed here because Aseprite sometimes returns frames that do not exist
    pcall(function() sprite:deleteFrame(sprite.frames[i]) end)
  end
end

local cel = sprite.cels[1]
if not cel then
  print("There is no active image")
end

local originalImage = cel.image:clone()
local modifiedImage = originalImage:clone()

for y = 0, originalImage.height - 1 do
  for x = 0, originalImage.width - 1 do
    local pixel = originalImage:getPixel(x, y)

    local r = app.pixelColor.rgbaR(pixel)
    local g = app.pixelColor.rgbaG(pixel)
    local b = app.pixelColor.rgbaB(pixel)
    local a = app.pixelColor.rgbaA(pixel)

    local notBlank = a ~= 0
    local notBlack = r ~= 0 or g ~= 0 or b ~= 0
    local h = rgbToHsl(r, g, b, a)
    if notBlack and notBlank and h == 0 then
      local newR, newG, newB = multiplyRgb(r, g, b, colorRgb[1], colorRgb[2], colorRgb[3])
      local newPixel = app.pixelColor.rgba(newR, newG, newB, a)
      modifiedImage:drawPixel(x, y, newPixel)
    end
  end
end

cel.image = modifiedImage
sprite:saveCopyAs(outPath)

app.exit()
